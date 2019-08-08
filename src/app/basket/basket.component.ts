import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { Basket } from "../models/basket.model"; 
import { BasketItem } from "../models/basket-item.model"; 
import { Product } from "../models/product.model";
import { DataService } from '../services/data.service'; 
import { BasketService } from '../services/basket.service';
import { BasketItemService } from '../services/basket-item.service';

interface IBasketItem extends BasketItem {
  product: Product;
  subtotal: number;
}

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy {

  public basket: Observable<Basket>;
  public basketItems: IBasketItem[];
  public itemCount: number;
  private products: Product[];
  private basketSubscription: Subscription;
  public currency: any;
  public exchangeRate: any;
  public exchangeRates$: Observable<any[]>;
  private errorMessage: any;

  constructor(private data: DataService, private basketService: BasketService) { 
  }

  ngOnInit(): void { 
    this.currency = "GBP";
    this.basket = this.basketService.get();
    this.basketSubscription = this.basket.subscribe((cart) => {
    this.itemCount = cart.items.map((x) => x.quantity).reduce((p, n) => p + n, 0);
    this.data.getProducts().subscribe((products) => {
      this.products = products;
      this.basketItems = cart.items
        .map((item) => {
          const product = this.products.find((p) => p.id === item.productId);
          return {
            ...item,
            product,
            subtotal: product.price * item.quantity };
        });
      });
    });
  }  

  ngOnDestroy() : void {
    if (this.basketSubscription) {
      this.basketSubscription.unsubscribe();
    }
  }

  public emptyCart(): void {
    this.basketService.empty();
  }

  private handleError(invoker, error) {
    console.error(`[BasketComponent.${invoker}] : ERROR : ${error}`);
    this.errorMessage  = "ERROR : ${error}`";
  }

  getExchangeRate(currency): void {
    this.data.getExchangeRate(currency)
      .subscribe(
        exchangeRate => {
          console.log(exchangeRate); 
          this.exchangeRate = exchangeRate;
        }, 
        error => this.handleError('getExchangeRate', error)
      )

    console.log(this.exchangeRate); 

  } 

  setCurrency(currency){
    this.getExchangeRate(currency);
    console.log(this.exchangeRate);  
  }

}
