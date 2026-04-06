import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FindTheItemQuestion {
    id: string;
    backgroundImage: ExternalBlob;
    items: Array<FindTheItemPlacedItem>;
}
export interface Game {
    id: GameId;
    primaryColor: string;
    icon: string;
    name: string;
    badges: Array<string>;
    tags: Array<string>;
    description: string;
    secondaryColor: string;
}
export interface FindTheItemPlacedItem {
    x: number;
    y: number;
    height: number;
    itemLabel: string;
    image: ExternalBlob;
    width: number;
}
export interface PlayerSession {
    gameId: string;
    correct: bigint;
    durationSeconds: bigint;
    timestamp: bigint;
    gameName: string;
    wrong: bigint;
}
export type Option = string;
export type QuestionId = string;
export type GameId = string;
export interface MatchWordToImageQuestion {
    id: QuestionId;
    correctOption: Option;
    image: ExternalBlob;
    options: Array<Option>;
}
export interface ChooseCorrectImageQuestion {
    id: string;
    correctImageIndex: bigint;
    word: string;
    images: Array<ExternalBlob>;
}
export interface backendInterface {
    createChooseCorrectImageQuestion(gameId: GameId, word: string, images: Array<ExternalBlob>, correctImageIndex: bigint): Promise<ChooseCorrectImageQuestion>;
    createFindTheItemQuestion(gameId: GameId, backgroundImage: ExternalBlob, items: Array<FindTheItemPlacedItem>): Promise<FindTheItemQuestion>;
    createGame(id: GameId, name: string, description: string, icon: string, badges: Array<string>, primaryColor: string, secondaryColor: string, tags: Array<string>): Promise<void>;
    createQuestion(gameId: GameId, image: ExternalBlob, options: Array<Option>, correctOption: Option): Promise<QuestionId>;
    deleteChooseCorrectImageQuestion(gameId: GameId, questionId: string): Promise<void>;
    deleteFindTheItemQuestion(gameId: GameId, questionId: string): Promise<void>;
    deleteQuestion(gameId: GameId, questionId: QuestionId): Promise<void>;
    getAllChooseCorrectImageQuestions(gameId: GameId): Promise<Array<ChooseCorrectImageQuestion>>;
    getAllFindTheItemQuestions(gameId: GameId): Promise<Array<FindTheItemQuestion>>;
    getAllGames(): Promise<Array<Game>>;
    getAllQuestions(gameId: GameId): Promise<Array<MatchWordToImageQuestion>>;
    getGameById(id: GameId): Promise<Game>;
    getGamesByTag(tag: string): Promise<Array<Game>>;
    getMyGameSessions(): Promise<Array<PlayerSession>>;
    getQuestion(gameId: GameId, questionId: QuestionId): Promise<MatchWordToImageQuestion | null>;
    saveGameSession(gameId: string, gameName: string, correct: bigint, wrong: bigint, durationSeconds: bigint): Promise<void>;
    updateChooseCorrectImageQuestion(gameId: GameId, questionId: string, word: string, images: Array<ExternalBlob>, correctImageIndex: bigint): Promise<void>;
    updateFindTheItemQuestion(gameId: GameId, questionId: string, backgroundImage: ExternalBlob, items: Array<FindTheItemPlacedItem>): Promise<void>;
    updateGame(id: GameId, name: string, description: string, icon: string, badges: Array<string>, primaryColor: string, secondaryColor: string, tags: Array<string>): Promise<void>;
    updateQuestion(gameId: GameId, questionId: QuestionId, image: ExternalBlob, options: Array<Option>, correctOption: Option): Promise<void>;
}
