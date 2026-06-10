import { google } from "googleapis";
import { updateAccessToken } from "./queries";
import type { GoogleCalendarToken } from "@/types";

type GoogleOAuth2Client = InstanceType<typeof google.auth.OAuth2>;

function createOAuth2Client(): GoogleOAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getOAuth2Client(): GoogleOAuth2Client {
  return createOAuth2Client();
}

export async function getAuthenticatedClient(
  token: GoogleCalendarToken,
  userId: string
): Promise<GoogleOAuth2Client> {
  const oauth2Client = createOAuth2Client();

  const fiveMinutesMs = 5 * 60 * 1000;
  const isExpired = token.expiry_date < Date.now() + fiveMinutesMs;

  if (isExpired) {
    oauth2Client.setCredentials({ refresh_token: token.refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccessToken = credentials.access_token;
    const newExpiryDate = credentials.expiry_date;
    if (!newAccessToken || !newExpiryDate) {
      throw new Error("トークンのリフレッシュに失敗しました");
    }
    await updateAccessToken(userId, newAccessToken, newExpiryDate);
    oauth2Client.setCredentials(credentials);
  } else {
    oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expiry_date: token.expiry_date,
    });
  }

  oauth2Client.on("tokens", async (credentials) => {
    if (credentials.access_token && credentials.expiry_date) {
      await updateAccessToken(userId, credentials.access_token, credentials.expiry_date);
    }
  });

  return oauth2Client;
}
