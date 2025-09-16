// Represents an individual cell 
export interface ExcelCell {
  value: string | number | null;
}

// Represents the structure of a simplified Excel sheet
export interface ExcelSheet {
  id: number;
  file_name: string;
  columns: string[];
  rows: ExcelCell[][];
}

// Represents a rich cell with formatting and metadata
export interface Column {
  value: string | null;
  font_color: string | null;
  fill_color: string;
  hyperlink: string | null;
  bold: boolean;
  italic: boolean;
  alignment: {
    horizontal: string | null;
    vertical: string | null;
  };
  is_merged: boolean;
  checkbox: boolean;
}

// Represents a sheet with rich cell data and column definitions
export interface Sheet {
  id: number;
  name: string;
  columns: Column[];
  rows: Column[][];
  columnDefs: string[]; // Used for Angular Material Table
  images?: {
    type: string;
    name: string;
    anchor: string;
    base64: string;
  }[];
}
