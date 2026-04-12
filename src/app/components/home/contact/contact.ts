import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FormState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent {
  formData = { name: '', email: '', message: '' };
  // Honeypot — intentionally not bound to a visible field
  honeypot = ''; // honeypot — bots fill this, humans don't

  state    = signal<FormState>('idle');
  errorMsg = signal('');

  links = [
    { label: 'GitHub',   href: 'https://github.com/scriptsl0th',        handle: '@scriptsl0th',          icon: 'github'   },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/dridi-aziz',     handle: 'Aziz Dridi',            icon: 'linkedin' },
    { label: 'Email',    href: 'mailto:dridiaziz28@gmail.com',           handle: 'dridiaziz28@gmail.com', icon: 'mail'     },
    { label: 'Location', href: '#',                                       handle: 'Tunis, Tunisia',        icon: 'location' },
  ];

  async onSubmit(): Promise<void> {
    const { name, email, message } = this.formData;
    if (!name.trim() || !email.trim() || !message.trim()) return;

    this.state.set('sending');
    this.errorMsg.set('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    name.trim(),
          email:   email.trim(),
          message: message.trim(),
          website: this.honeypot, // honeypot — always empty for real users
        }),
      });

      const body = await res.json();

      if (res.status === 429) {
        this.errorMsg.set('Slow down — max 3 messages per hour.');
        this.state.set('error');
        return;
      }

      if (!res.ok) {
        this.errorMsg.set(body.error ?? 'Something went wrong.');
        this.state.set('error');
        return;
      }

      this.state.set('success');
      this.formData = { name: '', email: '', message: '' };
    } catch {
      this.errorMsg.set('Network error — please try again.');
      this.state.set('error');
    }
  }

  reset(): void {
    this.state.set('idle');
    this.errorMsg.set('');
  }
}
