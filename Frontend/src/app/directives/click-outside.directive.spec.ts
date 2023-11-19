import { ClickOutsideDirective } from './click-outside.directive';
import { ElementRef } from '@angular/core';

describe('ClickOutsideDirective', () => {
  let directive: ClickOutsideDirective;
  let elementRef: ElementRef;
  let documentMock: Document;

  beforeEach(() => {
    elementRef = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    documentMock = document;

    directive = new ClickOutsideDirective(elementRef, documentMock);
  });

  it('should emit clickOutside event when clicked outside the element', () => {
    const clickOutsideSpy = spyOn(directive.clickOutside, 'emit');
    const outsideElement = document.createElement('div');

    const clickEvent = new MouseEvent('click', { bubbles: true });
    outsideElement.dispatchEvent(clickEvent);

    expect(clickOutsideSpy).toHaveBeenCalled();
  });

  it('should not emit clickOutside event when clicked inside the element', () => {
    const clickOutsideSpy = spyOn(directive.clickOutside, 'emit');
    const insideElement = elementRef.nativeElement;

    const clickEvent = new MouseEvent('click', { bubbles: true });
    insideElement.dispatchEvent(clickEvent);

    expect(clickOutsideSpy).not.toHaveBeenCalled();
  });

});
