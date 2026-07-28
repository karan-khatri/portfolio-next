export interface ActionResult {
  error?: string;
}

export interface ComposerActionResult extends ActionResult {
  revisionId?: string;
  previewToken?: string;
}
