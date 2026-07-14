import { ReactNode } from 'react';

interface Props {

  left?: ReactNode;

  right?: ReactNode;
}

export default function ActionToolbar({

  left,

  right,

}: Props) {

  return (

    <div
      className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
        mb-6
      "
    >

      <div>

        {left}

      </div>

      <div>

        {right}

      </div>

    </div>

  );

}