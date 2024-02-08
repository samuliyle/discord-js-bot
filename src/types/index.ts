import {
  ChatInputCommandInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { MysqlError } from "mysql";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type QueryCallback = (err: MysqlError | null, result?: any) => void | Promise<void>;

export interface CommandOptions {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder;
  execute: (
    interaction: CommandInteraction | ChatInputCommandInteraction
  ) => Promise<void>;
  options: {
    disabled: boolean;
  };
}

export type GoogleImageResponse = {
  items?: {
    title: string;
    link: string;
  }[];
};

export type GoogleErrorResponse = {
  error: {
    code: number;
    message: string;
  };
};
