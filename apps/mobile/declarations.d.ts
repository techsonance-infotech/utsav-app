declare module "expo-notifications" {
  export function setNotificationHandler(handler: any): void;
  export function getPermissionsAsync(): Promise<any>;
  export function requestPermissionsAsync(): Promise<any>;
  export function getExpoPushTokenAsync(options?: any): Promise<any>;
}
