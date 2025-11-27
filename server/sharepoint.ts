// SharePoint Integration - Microsoft Graph Client
import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sharepoint',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('SharePoint not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getSharePointClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

// Get SharePoint sites the user has access to
export async function getSharePointSites() {
  const client = await getSharePointClient();
  const sites = await client.api('/sites?search=*').get();
  return sites.value;
}

// Get a specific SharePoint site by site ID
export async function getSharePointSite(siteId: string) {
  const client = await getSharePointClient();
  const site = await client.api(`/sites/${siteId}`).get();
  return site;
}

// Get document libraries (drives) for a site
export async function getSiteDrives(siteId: string) {
  const client = await getSharePointClient();
  const drives = await client.api(`/sites/${siteId}/drives`).get();
  return drives.value;
}

// Get files in a drive/folder
export async function getDriveItems(siteId: string, driveId: string, folderId?: string) {
  const client = await getSharePointClient();
  const path = folderId 
    ? `/sites/${siteId}/drives/${driveId}/items/${folderId}/children`
    : `/sites/${siteId}/drives/${driveId}/root/children`;
  const items = await client.api(path).get();
  return items.value;
}

// Get lists for a site
export async function getSiteLists(siteId: string) {
  const client = await getSharePointClient();
  const lists = await client.api(`/sites/${siteId}/lists`).get();
  return lists.value;
}

// Get list items
export async function getListItems(siteId: string, listId: string) {
  const client = await getSharePointClient();
  const items = await client.api(`/sites/${siteId}/lists/${listId}/items?expand=fields`).get();
  return items.value;
}
