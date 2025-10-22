export type UploadMediaResponse = {
  message: string;
  data: {
    name: string;
    uri: string;
    size: number;
    created_date: string;
  };
};
