import { trigger, animate, transition, style, keyframes, state, group } from '@angular/animations';

export const fadeAnimation =
    trigger('fadeAnimation', [
        state('in', style({ opacity: 1 })),

        transition(':enter', [
            style({ opacity: 0 }),
            animate(600)
        ]),

        transition(':leave',
            animate(600, style({ opacity: 0 })))
    ]);

export const bounceIn = trigger('bounceAnimation', [
    transition('* => *', [
        animate('1s',
            keyframes([
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)', opacity: 0,
                    transform: 'scale3d(.3, .3, .3)', offset: 0
                }),
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                    transform: 'scale3d(1.1, 1.1, 1.1)', offset: .2
                }),
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                    transform: 'scale3d(.9, .9, .9)', offset: .4
                }),
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)', opacity: 1,
                    transform: 'scale3d(1.03, 1.03, 1.03)', offset: .6
                }),
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                    transform: 'scale3d(.97, .97, .97)', offset: .8
                }),
                style({
                    animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)', opacity: 1,
                    transform: 'scale3d(1, 1, 1)', offset: 1
                }),
            ])
        ),
    ])
]);

export const detailExpand = trigger('detailExpand', [
    state('collapsed', style({
        height: '0px',
        visibility: 'hidden',
        opacity: '0'
    })),
    transition(
        'collapsed => expanded', [
        group([
            animate('0.3s ease', style({
                height: '*',
                visibility: 'visible',
            })),
            animate('0.3s 0.2s ease', style({
                opacity: 1,
            })),
        ]),
    ]),
    transition(
        'expanded => collapsed', [
        group([
            animate('0.3s ease', style({
                opacity: 0
            })),
            animate('0.4s ease-out'),
        ]),
    ],
    ),
]);
