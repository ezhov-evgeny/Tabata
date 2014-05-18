//
//  Theme.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 16.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Tabata.h"

@protocol Theme <NSObject>

typedef enum {
    THEME_TIMER_INACTIVE,
    THEME_TIMER_EXERCISE,
    THEME_TIMER_RELAXATION,
    THEME_START,
    THEME_STOP,
    THEME_PAUSE,
    THEME_ROUND,
    THEME_NAVIGATION_BUTTONS
} ThemePropertyType;

- (UIColor *)getColorFor:(ThemePropertyType)property;

- (UIFont *)getFontFor:(ThemePropertyType)property;

- (CGFloat)getFontSizeFor:(ThemePropertyType)property;

@end
