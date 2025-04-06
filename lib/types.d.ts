declare module 'youtube-search-api' {
  export function GetListByKeyword(
    keyword: string, 
    withPlaylist: boolean, 
    limit?: number, 
    options?: Array<{ type: string }>
  ): Promise<{
    items: Array<any>;
    nextPage?: any;
    result?: any;
  }>;

  export default {
    GetListByKeyword
  };
}