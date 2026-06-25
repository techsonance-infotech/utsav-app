declare module "expo-notifications" {
  export function setNotificationHandler(handler: any): void;
  export function getPermissionsAsync(): Promise<any>;
  export function requestPermissionsAsync(): Promise<any>;
  export function getExpoPushTokenAsync(options?: any): Promise<any>;
}

declare module "expo-linear-gradient" {
  import * as React from "react";
  import { ViewProps } from "react-native";

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number } | [number, number];
    end?: { x: number; y: number } | [number, number];
    locations?: number[];
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
}
