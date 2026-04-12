import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent {
  formData = { name: '', email: '', message: '' };
  submitted = signal(false);
  sending = signal(false);

  links = [
    {
      label: 'GitHub',
      href: 'https://github.com/azizdridi44',
      icon: 'github',
      handle: '@azizdridi44',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/aziz-dridi',
      icon: 'linkedin',
      handle: 'aziz-dridi',
    },
    {
      label: 'Email',
      href: 'mailto:azizdridi44@gmail.com',
      icon: 'mail',
      handle: 'azizdridi44@gmail.com',
    },
    {
      label: 'Location',
      href: 'https://maps.google.com/?q=Tunis,Tunisia',
      icon: 'location',
      handle: 'Tunis, Tunisia',
    },
  ];

  onSubmit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.message) return;
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.submitted.set(true);
      this.formData = { name: '', email: '', message: '' };
    }, 1500);
  }
}
