import { Code } from '@mantine/core';
import { CodeBlock } from '~/components/CodeBlock';
import { InternalLink } from '~/components/InternalLink';
import { PageNavigation } from '~/components/PageNavigation';
import { PageTitle } from '~/components/PageTitle';
import { Txt } from '~/components/Txt';
import { readCodeFile } from '~/lib/code';
import { getRouteMetadata } from '~/lib/utils';
import { CustomizingBorderColorsExample } from './CustomizingBorderColorsExample';

const PATH = '/examples/customizing-border-colors';

export const metadata = getRouteMetadata(PATH);

export default async function CustomizingBorderColorsExamplePage() {
  const code = await readCodeFile<string>(`${PATH}/CustomizingBorderColorsExample.tsx`);

  return (
    <>
      <PageTitle of={PATH} />
      <Txt>
        If you’re not happy with the default border colors, you can customize them using <Code>borderColor</Code> and{' '}
        <Code>rowBorderColor</Code> properties.
      </Txt>
      <Txt>
        The <Code>borderColor</Code> is applied to:
      </Txt>
      <ul>
        <li>
          the table outer border (if enabled by{' '}
          <InternalLink to="/examples/basic-table-properties">
            <Code>withTableBorder</Code> property
          </InternalLink>
          );
        </li>
        <li>header bottom border;</li>
        <li>
          footer top border (see{' '}
          <InternalLink to="/examples/column-properties/#column-footers">column footers</InternalLink>);
        </li>
        <li>
          pagination top border (see <InternalLink to="/examples/pagination">pagination</InternalLink>).
        </li>
      </ul>
      <Txt>
        The <Code>rowBorderColor</Code> is applied to:
      </Txt>
      <ul>
        <li>the bottom of each row;</li>
        <li>
          the column borders (if enabled by{' '}
          <InternalLink to="/examples/basic-table-properties">
            <Code>withTableBorder</Code> property
          </InternalLink>
          ).
        </li>
      </ul>
      <Txt>For example, this code:</Txt>
      <CodeBlock code={code} />
      <Txt>…will produce the following table:</Txt>
      <CustomizingBorderColorsExample />
      <Txt>Head over to the next example to discover more features.</Txt>
      <PageNavigation of={PATH} />
    </>
  );
}
