import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'readTime', standalone: true })
export class ReadTimePipe implements PipeTransform {
  transform(wordCount: number): string {
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  }
}
