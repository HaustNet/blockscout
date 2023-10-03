import { CheckboxGroup, Checkbox, Text, Flex, Link, useCheckboxGroup, chakra } from '@chakra-ui/react';
import React from 'react';

import { BRIDGED_TOKENS_CHAINS } from './utils';

interface Props {
  onChange: (nextValue: Array<string>) => void;
  defaultValue?: Array<string>;
}

const TokensBridgedChainsFilter = ({ onChange, defaultValue }: Props) => {
  const { value, setValue } = useCheckboxGroup({ defaultValue });

  const handleReset = React.useCallback(() => {
    setValue([]);
    onChange([]);
  }, [ onChange, setValue ]);

  const handleChange = React.useCallback((nextValue: Array<string>) => {
    setValue(nextValue);
    onChange(nextValue);
  }, [ onChange, setValue ]);

  return (
    <>
      <Flex justifyContent="space-between" fontSize="sm">
        <Text fontWeight={ 600 } variant="secondary">Show bridged tokens from</Text>
        <Link onClick={ handleReset }>Reset</Link>
      </Flex>
      <CheckboxGroup size="lg" onChange={ handleChange } value={ value }>
        { BRIDGED_TOKENS_CHAINS.map(({ title, id, short_title: shortTitle }) => (
          <Checkbox key={ id } value={ id } fontSize="md" whiteSpace="pre-wrap">
            <span>{ title }</span>
            <chakra.span color="text_secondary"> ({ shortTitle })</chakra.span>
          </Checkbox>
        )) }
      </CheckboxGroup>
    </>
  );
};

export default React.memo(TokensBridgedChainsFilter);
