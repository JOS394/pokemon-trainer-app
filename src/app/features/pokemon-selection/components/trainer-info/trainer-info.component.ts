import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trainer } from '../../../../core/models/trainer.interface';

@Component({
  selector: 'app-trainer-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-info.component.html',
  styleUrls: ['./trainer-info.component.scss']
})
export class TrainerInfoComponent {
  @Input() trainer: Trainer | null = null;
}