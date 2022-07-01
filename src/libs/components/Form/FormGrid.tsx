import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';

const outlines = { border: '0.5px dashed gray' };

export type FormGridProps = {
  layout?: number[][];
  items: React.ReactNode[];
  verbose: boolean;
};

export const FormGrid = ({ layout, items = [], verbose }: FormGridProps) => {
  let i = 0;
  if (_.isNil(layout)) {
    layout = items.map(() => [6]);
  }
  return (
    <div>
      {layout.map((row) =>
        !items[i] ? null : (
          <div key={`row-${i}`} className="p-fluid p-formgrid p-grid p-ai-start">
            {row
              .map((col) =>
                !items[i] ? null : (
                  <div key={`col-${i}-${col}`} className={classNames('p-field', col > 0 ? `p-col-${col}` : 'p-col')} style={verbose ? outlines : {}}>
                    {verbose ? <div style={{ position: 'relative', float: 'right', border: '0.5px dashed', padding: 4 }}>{`idx: ${i - 1},  col: ${col}`}</div> : null}
                    {items[i++]}
                  </div>
                ),
              )
              .filter((item) => !_.isNil(item))}
          </div>
        ),
      )}
    </div>
  );
};
