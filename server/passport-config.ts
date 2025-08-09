import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";
import { nanoid } from "nanoid";

// Use provided Discord credentials if environment variables are missing
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1403800460476944424";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "7KEyIeFI7N6jJN48WG_ieSREyvftCdU0";
const BASE_URL = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5000";

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.error("Discord OAuth credentials are missing!");
  console.error("Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables");
} else {
  console.log("Discord OAuth configured with client ID:", DISCORD_CLIENT_ID);
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: DISCORD_CLIENT_ID!,
  clientSecret: DISCORD_CLIENT_SECRET!,
  callbackURL: "https://ownersalliance.org/auth/discord/callback",
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Discord OAuth profile:", {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      discriminator: profile.discriminator,
      avatar: profile.avatar
    });

    // Check if user already exists by Discord ID
    let user = await storage.getUserByDiscordId(profile.id);
    
    if (user) {
      // Update user's Discord info
      user = await storage.updateUser(user.id, {
        discordUsername: profile.username,
        discordDiscriminator: profile.discriminator,
        discordAvatar: profile.avatar,
        profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined
      });
      
      console.log("Existing Discord user logged in:", user.username);
      return done(null, user);
    }

    // Check if user exists by email
    if (profile.email) {
      user = await storage.getUserByEmail(profile.email);
      
      if (user) {
        // Link Discord account to existing user
        user = await storage.updateUser(user.id, {
          discordId: profile.id,
          discordUsername: profile.username,
          discordDiscriminator: profile.discriminator,
          discordAvatar: profile.avatar,
          profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined
        });
        
        console.log("Linked Discord to existing user:", user.username);
        return done(null, user);
      }
    }

    // Create new user
    const newUser = await storage.createUser({
      username: profile.username + "_" + nanoid(6),
      email: profile.email || `${profile.username}@discord.local`,
      role: "user",
      firstName: profile.username,
      lastName: "",
      discordId: profile.id,
      discordUsername: profile.username,
      discordDiscriminator: profile.discriminator,
      discordAvatar: profile.avatar,
      profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined
    });

    console.log("New Discord user created:", newUser.username);
    return done(null, newUser);

  } catch (error) {
    console.error("Discord OAuth error:", error);
    return done(error, false);
  }
}));

export { passport };