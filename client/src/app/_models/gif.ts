export interface GiphyResult {
    data: Array<GifData>;
    pagination: {
      count: number;
      offset: number;
    };
  }
  
  export interface GifData {
    images: {
      fixed_width: {
        url: string;
      };
    };
    title: string;
  }
  
  export interface SearchReqeust {
    searchTerm: string;
    offset: number;
    pageSize: number;
  }
  