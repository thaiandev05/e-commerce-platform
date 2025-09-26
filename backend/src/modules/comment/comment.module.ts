import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [ProductModule],
	providers: [CommentService]
})
export class CommentModule {}
