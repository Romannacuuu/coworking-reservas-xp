import { Before } from '@cucumber/cucumber';
import { MundoApi } from './mundo';

Before(function (this: MundoApi) {
  this.reiniciar();
});
