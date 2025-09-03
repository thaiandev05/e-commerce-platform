import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { FacebookOAuth2User } from "../user.interface";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
	constructor(
		private readonly configService: ConfigService
	) {
		super({
			clientID: configService.getOrThrow<string>("FACEBOOK_APP_ID"),
			clientSecret: configService.getOrThrow<string>("FACEBOOK_APP_SECRET"),
			callbackURL: configService.getOrThrow<string>("FACEBOOK_CALLBACK_URL"),
			scope: ['email', 'public_profile'],
			profileFields: ['id', 'displayName', 'name', 'email', 'picture.type(large)']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<FacebookOAuth2User> {
		const { id, displayName, name, emails, photos } = profile;

		// Match the FacebookOAuth2User interface
		const user: FacebookOAuth2User = {
			providerUserId: id,
			email: emails?.[0]?.value || '',
			fullname: displayName || `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
			firstname: name?.givenName,
			lastname: name?.familyName,
			avatarUrl: photos?.[0]?.value,
			username: displayName || `${name?.givenName || ''}_${name?.familyName || ''}`.replace(' ', '_'),
			provider: 'FACEBOOK',
			accessToken,
		};

		return user;
	}
}
