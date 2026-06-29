import { Injectable, signal, computed } from '@angular/core';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML format
  publishedAt: string;
  category: string;
  tags: string[];
  readTime: string;
  coverImage?: string;
  featured?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private posts = signal<BlogPost[]>([
    {
      id: '1',
      slug: 'zero-downtime-deployments-docker-nginx',
      title: 'Unlocking Zero-Downtime Deployments with Docker and Nginx',
      excerpt: 'How to set up blue-green deployments for active containers using reverse proxy reloads without disrupting users.',
      category: 'DevOps',
      tags: ['Docker', 'Nginx', 'CI/CD', 'Bash'],
      readTime: '4 min read',
      publishedAt: 'June 25, 2026',
      featured: true,
      content: `
        <p>In modern web architectures, deploying updates to production without interrupting active user sessions is a critical requirement. A standard deployment pattern involves shutting down the running container and starting the new one, resulting in seconds to minutes of downtime. In this article, we'll design a <strong>Blue-Green Deployment pipeline</strong> using Docker and Nginx reload commands that achieves zero downtime.</p>

        <h3>1. The Architecture</h3>
        <p>We maintain two instances of our app running in separate Docker containers: <code>app-blue</code> (listening on port <code>3000</code>) and <code>app-green</code> (listening on port <code>3001</code>). Nginx stands in front as a reverse proxy, directing traffic to whichever container is designated as "active".</p>
        
        <pre><code class="language-plaintext">
[ Client Traffic ] ---> [ Nginx Proxy ]
                            |
             +--------------+--------------+
             |                             |
     [ app-blue:3000 ]             [ app-green:3001 ]
     (Active / Live)               (Idle / Deploying)
        </code></pre>

        <h3>2. Nginx Upstream Configuration</h3>
        <p>First, configure Nginx to use a dynamic upstream server definition. We define a backend upstream pointing to our containers and a mapping file that tells Nginx which container is currently primary.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">/etc/nginx/conf.d/app.conf</span>
          </div>
          <pre><code class="language-nginx">upstream backend_app {
    server 127.0.0.1:3000; # Blue
    # server 127.0.0.1:3001; # Green (Idle)
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}</code></pre>
        </div>

        <h3>3. Automation Bash Script</h3>
        <p>To automate the swap, we write a Bash script that checks which environment is currently running, pulls and starts the new environment, runs health checks on the new environment, edits Nginx configuration to point to it, and reloads Nginx gracefully.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">deploy.sh</span>
          </div>
          <pre><code class="language-bash">#!/bin/bash
set -e

# Identify currently running target
CURRENT_TARGET=$(docker ps --format "{{.Names}}" | grep -E "app-(blue|green)" || echo "none")

if [ "$CURRENT_TARGET" = "app-blue" ]; then
    NEW_TARGET="green"
    NEW_PORT=3001
    OLD_TARGET="blue"
    OLD_PORT=3000
else
    NEW_TARGET="blue"
    NEW_PORT=3000
    OLD_TARGET="green"
    OLD_PORT=3001
fi

echo "Deploying to target: app-$NEW_TARGET on port $NEW_PORT..."

# Step 1: Run new container
docker run -d --name "app-$NEW_TARGET" -p "$NEW_PORT:3000" myapp:latest

# Step 2: Health Check
echo "Running health checks..."
for i in {1..10}; do
    if curl -s "http://localhost:$NEW_PORT/api/health" | grep "OK" > /dev/null; then
        echo "New container is healthy!"
        break
    fi
    sleep 2
    if [ $i -eq 10 ]; then
        echo "Health check failed! Teardown."
        docker rm -f "app-$NEW_TARGET"
        exit 1
    fi
done

# Step 3: Swap upstream in Nginx conf
sed -i "s/127.0.0.1:$OLD_PORT/127.0.0.1:$NEW_PORT/g" /etc/nginx/conf.d/app.conf

# Step 4: Graceful Reload Nginx (zero connections dropped)
nginx -s reload

# Step 5: Clean up old container
echo "Stopping old target app-$OLD_TARGET..."
docker stop "app-$OLD_TARGET"
docker rm "app-$OLD_TARGET"

echo "Blue-green deployment completed successfully!"</code></pre>
        </div>

        <h3>Conclusion</h3>
        <p>Using Nginx’s <code>nginx -s reload</code> command is the magic. It spawns new Nginx worker processes that handle incoming requests, while letting older workers complete active requests before terminating. Combined with Docker health checks, you get a solid, simple, and serverless zero-downtime deployment setup.</p>
      `,
    },
    {
      id: '2',
      slug: 'scaling-express-api-postgres-indexing',
      title: 'Scaling Express APIs: Optimising PostgreSQL Queries and Indexing',
      excerpt: 'A practical guide to database indexing, query optimization, and Sequelize performance tuning for high-throughput node applications.',
      category: 'Backend',
      tags: ['Node.js', 'Express', 'PostgreSQL', 'Sequelize'],
      readTime: '6 min read',
      publishedAt: 'May 18, 2026',
      content: `
        <p>As backend applications grow, performance bottlenecks inevitably migrate from CPU or memory bounds in Node.js to database I/O bounds. A query that takes 10ms with 1,000 rows can easily take 2,000ms with 1,000,000 rows, exhausting the Express thread pool. Here is how we analyze, index, and optimize Postgres operations inside an Express application.</p>

        <h3>1. Locating Slow Queries (The EXPLAIN Tool)</h3>
        <p>Before adding indices randomly (which degrades write speeds), always analyze the query execution plan. Prefix your queries with <code>EXPLAIN ANALYZE</code> in PostgreSQL to see what the engine is doing under the hood.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">SQL (Analyzing sequential scan)</span>
          </div>
          <pre><code class="language-sql">EXPLAIN ANALYZE 
SELECT * FROM "Orders" 
WHERE "status" = 'completed' AND "userId" = 10452;

-- Result:
-- Seq Scan on "Orders" (cost=0.00..38541.20 rows=4 width=128) (actual time=87.521..87.521 rows=4 loops=1)
--   Filter: (("status" = 'completed'::text) AND ("userId" = 10452))
--   Rows Removed by Filter: 999996
-- Planning Time: 0.124 ms
-- Execution Time: 87.640 ms</code></pre>
        </div>

        <p>The output shows a <strong>Seq Scan (Sequential Scan)</strong>. This means PostgreSQL had to read every single one of the 1,000,000 records off the hard drive to find the 4 that match. That's extremely inefficient.</p>

        <h3>2. Creating a Composite Index</h3>
        <p>Since our query filters on both <code>userId</code> and <code>status</code>, we can create a composite B-Tree index covering both columns. In PostgreSQL, index order matters (Left-to-Right rule). Put the column with the highest cardinality (most unique values, like <code>userId</code>) first.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">Migration SQL</span>
          </div>
          <pre><code class="language-sql">CREATE INDEX "idx_orders_user_status" ON "Orders" ("userId", "status");</code></pre>
        </div>

        <p>Let's run <code>EXPLAIN ANALYZE</code> again after adding the index:</p>
        <pre><code class="language-plaintext">
-- Result:
-- Index Scan using idx_orders_user_status on "Orders" (cost=0.42..16.54 rows=4 width=128) (actual time=0.042..0.051 rows=4 loops=1)
--   Index Cond: (("userId" = 10452) AND ("status" = 'completed'::text))
-- Planning Time: 0.098 ms
-- Execution Time: 0.075 ms
        </code></pre>
        <p>We switched from a <code>Seq Scan</code> to an <code>Index Scan</code>, dropping the query execution time from <strong>87.6ms to 0.07ms</strong>! That's a 1,200x performance increase.</p>

        <h3>3. Sequelize Performance Tuning</h3>
        <p>When working with Sequelize ORM, developers often make the mistake of fetching massive tables without pagination or selecting columns they don't need. Here is a secure, optimized repository implementation:</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">order.controller.ts</span>
          </div>
          <pre><code class="language-typescript">import { Request, Response } from 'express';
import { Order } from '../models/Order';

export const getCompletedUserOrders = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.userId);
  const limit = Math.min(Number(req.query.limit) || 10, 50); // Hard cap on limits
  const offset = Number(req.query.offset) || 0;

  try {
    const { count, rows } = await Order.findAndCountAll({
      where: {
        userId,
        status: 'completed'
      },
      attributes: ['id', 'totalAmount', 'createdAt'], // Avoid SELECT *
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      raw: true, // Speeds up queries by skipping Sequelize instance wrapping
    });

    res.json({
      data: rows,
      meta: {
        totalItems: count,
        limit,
        offset
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal database error' });
  }
};</code></pre>
        </div>

        <h3>Summary Checklist</h3>
        <ul>
          <li><strong>Explain Analyze:</strong> Profile before fixing.</li>
          <li><strong>Composite Indices:</strong> Group filter keys, placing columns with high cardinality first.</li>
          <li><strong>ORM Selects:</strong> Always limit fields, implement keys pagination, and use <code>raw: true</code> when write instances aren't needed.</li>
        </ul>
      `,
    },
    {
      id: '3',
      slug: 'reactive-ui-angular-signals-store',
      title: 'Building Reactive UI in Angular 21 with Signals',
      excerpt: 'Say goodbye to RxJS boilerplate. Explore how native signals simplify local state management and improve rendering cycles.',
      category: 'Frontend',
      tags: ['Angular', 'Signals', 'TypeScript'],
      readTime: '5 min read',
      publishedAt: 'April 02, 2026',
      content: `
        <p>Angular has historically relied heavily on RxJS for component reactivity. While powerful, RxJS forces developers to deal with complex stream manipulation (like <code>switchMap</code> or <code>shareReplay</code>) and subscription leaks. With Angular signals, state reactivity is built natively into the compiler engine.</p>

        <h3>1. The Core Concept</h3>
        <p>A signal is a wrapper around a value that notifies consumers whenever it changes. Unlike Observables, signals are synchronous, don't require subscriptions, and track their dependencies automatically when computed.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">TypeScript (Signals API basics)</span>
          </div>
          <pre><code class="language-typescript">import { signal, computed } from '@angular/core';

// Writable Signal
const count = signal(0);

// Read-only Computed Signal (re-runs only when 'count' changes)
const doubleCount = computed(() => count() * 2);

console.log(count()); // 0
console.log(doubleCount()); // 0

count.set(5);
console.log(doubleCount()); // 10</code></pre>
        </div>

        <h3>2. Building a Clean Signal-Based Store</h3>
        <p>Instead of installing heavy external store packages, you can construct a lightweight, high-performance state management service using raw Angular signals. Here is a fully typed blog state manager:</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">blog-store.service.ts</span>
          </div>
          <pre><code class="language-typescript">import { Injectable, signal, computed } from '@angular/core';

export interface BlogState {
  posts: any[];
  searchQuery: string;
  selectedCategory: string | null;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class BlogStore {
  // Private writeable state
  private state = signal<BlogState>({
    posts: [],
    searchQuery: '',
    selectedCategory: null,
    loading: false,
  });

  // Public computed signals for components to consume
  readonly posts = computed(() => this.state().posts);
  readonly searchQuery = computed(() => this.state().searchQuery);
  readonly selectedCategory = computed(() => this.state().selectedCategory);
  readonly loading = computed(() => this.state().loading);

  // Advanced Computed selector: automatically filters posts reactively
  readonly filteredPosts = computed(() => {
    const { posts, searchQuery, selectedCategory } = this.state();
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  });

  // State mutators (Actions)
  setPosts(posts: any[]): void {
    this.state.update(s => ({ ...s, posts }));
  }

  setSearchQuery(query: string): void {
    this.state.update(s => ({ ...s, searchQuery: query }));
  }

  setCategory(category: string | null): void {
    this.state.update(s => ({ ...s, selectedCategory: category }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, loading }));
  }
}</code></pre>
        </div>

        <h3>3. Rendering in the Component Template</h3>
        <p>In the component template, we invoke the signals as methods (e.g. <code>posts()</code> or <code>searchQuery()</code>). Since there are no Observables, there is no need for the <code>async</code> pipe or cleaning up subscriptions in <code>OnDestroy</code>.</p>

        <div class="code-frame">
          <div class="code-header">
            <span class="code-title">blog-list.component.html</span>
          </div>
          <pre><code class="language-html">&lt;div class="blog-dashboard"&gt;
  &lt;input 
    type="text" 
    [value]="store.searchQuery()" 
    (input)="onSearch($event)" 
    placeholder="Search blogs..." /&gt;

  &lt;div class="grid"&gt;
    @for (post of store.filteredPosts(); track post.id) {
      &lt;div class="card"&gt;
        &lt;h3&gt;{{ post.title }}&lt;/h3&gt;
        &lt;p&gt;{{ post.excerpt }}&lt;/p&gt;
      &lt;/div&gt;
    } @empty {
      &lt;p&gt;No articles match your criteria.&lt;/p&gt;
    }
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
        </div>

        <h3>Why Signals are the Future</h3>
        <p>By bypassing Zone.js change detection triggers, signals allow Angular to run change detection selectively on the specific DOM nodes that depend on changed signal values. This leads to outstanding rendering performance and simplifies state codebases.</p>
      `,
    },
  ]);

  // Read signal data
  getPosts = computed(() => this.posts());

  getPostBySlug(slug: string): BlogPost | undefined {
    return this.posts().find((post) => post.slug === slug);
  }

  // Helper to fetch similar posts based on category or tags
  getRelatedPosts(slug: string, limit = 2): BlogPost[] {
    const active = this.getPostBySlug(slug);
    if (!active) return [];
    return this.posts()
      .filter((post) => post.slug !== slug && (post.category === active.category || post.tags.some((t) => active.tags.includes(t))))
      .slice(0, limit);
  }

  // Get next & previous posts for navigation
  getAdjacentPosts(slug: string): { next?: BlogPost; prev?: BlogPost } {
    const list = this.posts();
    const index = list.findIndex((post) => post.slug === slug);
    if (index === -1) return {};
    return {
      next: index > 0 ? list[index - 1] : undefined,
      prev: index < list.length - 1 ? list[index + 1] : undefined,
    };
  }
}
