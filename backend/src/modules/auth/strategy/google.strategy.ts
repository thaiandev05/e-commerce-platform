import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { GoogleOAuth2User } from "../user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly configService: ConfigService
	) {
		super({
			clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
			clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
			callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
			scope: ['email', 'profile']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		const { id, name, emails, photos, displayName } = profile;

		// Match the GoogleOAuth2User interface
		const user: GoogleOAuth2User = {
			providerUserId: id,
			email: emails[0].value,
			fullname: displayName || `${name.givenName} ${name.familyName}`,
			firstname: name.givenName,
			lastname: name.familyName,
			avatarUrl: photos[0]?.value,
			username: displayName || `${name.givenName}_${name.familyName}`,
			provider: 'GOOGLE',
			accessToken,
		};

		done(null, user);
	}
}