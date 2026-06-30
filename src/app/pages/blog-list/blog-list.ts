import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog/blog.service';
import { NavbarComponent } from '../../components/layout/navbar/navbar';
import { FooterComponent } from '../../components/layout/footer/footer';
import { ReadingProgressComponent } from '../../components/layout/reading-progress/reading-progress';
import { BackToTopComponent } from '../../components/layout/back-to-top/back-to-top';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ReadingProgressComponent,
    BackToTopComponent,
  ],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss',
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);

  categories = ['All', 'DevOps', 'Backend', 'Frontend'];

  // Helper for two-way binding
  get searchValue(): string {
    return this.searchQuery();
  }
  set searchValue(value: string) {
    this.searchQuery.set(value);
  }

  featuredPost = computed(() => {
    return this.blogService.getPosts().find((post) => post.featured);
  });

  filteredPosts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const allPosts = this.blogService.getPosts();

    return allPosts.filter((post) => {
      // Category filter: if no category selected (null), show all
      const categoryMatch = !cat || post.category === cat;

      // Search filter: if no query, show all
      const searchMatch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      return categoryMatch && searchMatch;
    });
  });

  ngOnInit(): void {
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          }),
        { threshold: 0.05 },
      );
      document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    }, 100);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category === 'All' ? null : category);
  }
}
