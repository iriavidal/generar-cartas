import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BtNames } from './core/enums/bt-names';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  btNames = BtNames;
  selectedBt: string = BtNames.BT21;

  availableFields = [
    'name',
    'type',
    'id',
    'level',
    'play_cost',
    'evolution_cost',
    'evolution_color',
    'evolution_level',
    'xros_req',
    'color',
    'color2',
    'digi_type',
    'digi_type2',
    'form',
    'dp',
    'attribute',
    'rarity',
    'stage',
    'artist',
    'main_effect',
    'source_effect',
    'alt_effect',
    'series',
    'pretty_url',
    'date_added',
    'tcgplayer_name',
    'tcgplayer_id',
    'set_name',
    'alternative',
  ];

  selectedFields: { [key: string]: boolean } = {};

  constructor(private http: HttpClient) {
    this.loadFieldsFromStorage();
  }

  markAllFields(value: boolean): void {
    this.availableFields.forEach((field) => {
      this.selectedFields[field] = value;
    });
    this.saveFieldsToStorage();
  }

  toggleField(field: string): void {
    this.selectedFields[field] = !this.selectedFields[field];
    this.saveFieldsToStorage();
  }

  saveFieldsToStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }

  loadFieldsFromStorage(): void {
    const stored = localStorage.getItem('selectedFields');
    if (stored) {
      this.selectedFields = JSON.parse(stored);
    } else {
      this.markAllFields(true);
    }
  }

  fetchAndDownloadJson(): void {
    const apiUrl = `/api/search.php?pack=${encodeURIComponent(
      this.selectedBt
    )}`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (cards) => {
        const filtered = cards.map((card) => {
          const result: any = {};

          for (const field of this.availableFields) {
            if (this.selectedFields[field]) {
              result[field] = field === 'alternative' ? false : card[field];
            }
          }

          return result;
        });

        const json = JSON.stringify(filtered, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedBt}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al obtener las cartas:', err);
      },
    });
  }
}
