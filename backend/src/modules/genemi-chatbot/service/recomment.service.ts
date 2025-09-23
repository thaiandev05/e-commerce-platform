import { ProductService } from "@/modules/product/service/product.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RecommentService {

	constructor(
		private readonly productService: ProductService
	) { }

	async handleRecommendation(prompt: string) {
		return await this.productService.searchProducts(prompt)
	}

}