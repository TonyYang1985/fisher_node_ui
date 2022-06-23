import axios from 'axios';
import { FileUpload, FileUploadProps } from 'primereact/fileupload';
import React from 'react';
import { restClient } from '../RC';
import { DataSource, RestClientDS } from './DataSource';

export type UploadResult = { url: string; name: string; size: number; mimetype: string };

export type UploaderProps = {
  onChange?: (result: any) => void;
  rcDs?: RestClientDS;
} & FileUploadProps;

export const Uploader = ({ url, maxFileSize, onUpload, onChange, rcDs, ...props }: UploaderProps) => {
  const comp = (uploadUrl: string | undefined) => (
    <DataSource ctlDs={[[uploadUrl], (uploadUrl) => axios.get(uploadUrl).then((resp) => resp.data)]}>
      <DataSource.Data>
        {(rs) => (
          <FileUpload
            url={uploadUrl}
            maxFileSize={rs.maxFileSize}
            onUpload={(xhr) => {
              if (onUpload) {
                onUpload(xhr);
              }
              const result = JSON.parse(xhr.xhr.response);
              if (onChange) {
                onChange(result);
              }
            }}
            {...props}
          />
        )}
      </DataSource.Data>
    </DataSource>
  );
  if (rcDs) {
    let api;
    let pathParam;
    let urlParam;
    if (typeof rcDs === 'string') {
      api = rcDs;
    } else {
      api = rcDs[0];
      pathParam = rcDs[1].pathParam;
      urlParam = rcDs[1].urlParam;
    }
    return (
      <DataSource ctlDs={[[], () => restClient.getApiEndpoint(api, pathParam, urlParam)]}>
        <DataSource.Data>
          {({ endPoint, method }) => {
            return comp(endPoint);
          }}
        </DataSource.Data>
      </DataSource>
    );
  } else {
    return comp(url);
  }
};
