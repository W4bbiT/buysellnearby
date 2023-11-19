import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/productModel';
import { SearchDataService } from 'src/app/services/search-data.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {
  searchResults: any;


  constructor(private data: SearchDataService) { }

  ngOnInit(): void {
    this.data.currentData.subscribe(data => this.searchResults = data)
  }

}
