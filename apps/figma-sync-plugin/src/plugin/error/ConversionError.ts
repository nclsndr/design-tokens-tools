export class ConversionError extends Error {
  readonly _tag = 'ConversionError';

  variableId: string | undefined;
  variableName: string | undefined;
  collectionId: string | undefined;
  collectionName: string | undefined;
  currentModeId: string | undefined;
  currentModeName: string | undefined;

  constructor(params: {
    message: string;
    variableId?: string;
    variableName?: string;
    collectionId?: string;
    collectionName?: string;
    currentModeId?: string;
    currentModeName?: string;
  }) {
    super(params.message);
    this.variableId = params.variableId;
    this.variableName = params.variableName;
    this.collectionId = params.collectionId;
    this.collectionName = params.collectionName;
    this.currentModeId = params.currentModeId;
    this.currentModeName = params.currentModeName;
  }

  toJSON() {
    return {
      _tag: this._tag,
      message: this.message,
      variableId: this.variableId,
      variableName: this.variableName,
      collectionId: this.collectionId,
      collectionName: this.collectionName,
      currentModeId: this.currentModeId,
      currentModeName: this.currentModeName,
    };
  }
}
