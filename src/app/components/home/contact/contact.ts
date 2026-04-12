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
  state = signal<FormState>('idle');
  errorMsg = signal('');

  links = [
    { label: 'GitHub',   href: 'https://github.com/azizdridi44',          handle: '@azizdridi44',            icon: 'github'   },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/aziz-dridi',       handle: 'aziz-dridi',              icon: 'linkedin' },
    { label: 'Email',    href: 'mailto:azizdridi44@gmail.com',             handle: 'azizdridi44@gmail.com',   icon: 'mail'     },
    { label: 'Location', href: '#',                                         handle: 'Tunis, Tunisia',          icon: 'location' },
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
        body: JSON.stringify({ name, email, message }),
      });

      const body = await res.json();

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
