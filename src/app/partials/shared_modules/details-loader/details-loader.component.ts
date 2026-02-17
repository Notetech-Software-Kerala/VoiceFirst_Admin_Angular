import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-details-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './details-loader.component.html',
    styleUrls: ['./details-loader.component.css']
})
export class DetailsLoaderComponent {
    @Input() title: boolean = true;
    @Input() rows: number = 3;
    @Input() cardClass: string = 'detail-card';
}
