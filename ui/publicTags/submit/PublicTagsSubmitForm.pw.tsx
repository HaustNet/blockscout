import { Box } from '@chakra-ui/react';
import React from 'react';

import { publicTagTypes as configMock } from 'mocks/metadata/publicTagTypes';
import { base as useInfoMock } from 'mocks/user/profile';
import { expect, test } from 'playwright/lib';
import * as configs from 'playwright/utils/configs';

import * as mocks from './mocks';
import PublicTagsSubmitForm from './PublicTagsSubmitForm';

const onSubmitResult = () => {};

test('base view +@mobile', async({ render }) => {
  const component = await render(
    <Box sx={{ '.recaptcha': { w: '304px', h: '78px' } }}>
      <PublicTagsSubmitForm config={ configMock } onSubmitResult={ onSubmitResult } userInfo={ useInfoMock }/>
    </Box>,
  );

  await component.getByLabel(/Smart contract \/ Address/i).fill(mocks.address1);
  await component.getByLabel(/add/i).nth(1).click();

  await component.getByLabel('Tag (max 35 characters)*').fill(mocks.tag1.name);
  await component.getByLabel(/label url/i).fill(mocks.tag1.meta.tagUrl);
  await component.getByLabel(/background color/i).fill(mocks.tag1.meta.bgColor.replace('#', ''));
  await component.getByLabel(/text color/i).fill(mocks.tag1.meta.textColor.replace('#', ''));

  await component.getByLabel(/add/i).nth(3).click();
  await component.getByLabel(/comment/i).focus();
  await component.getByLabel(/comment/i).blur();

  await expect(component).toHaveScreenshot({
    mask: [ component.locator('.recaptcha') ],
    maskColor: configs.maskColor,
  });
});