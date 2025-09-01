import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { hash } from 'argon2'
import { RegisterDto } from '../dto/register.dto';
@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService
	) { }

	// hasing 
	private hasing(text: string) {
		return hash(text)
	}

	// register 
	public async register(dto: RegisterDto) {}
	
}
