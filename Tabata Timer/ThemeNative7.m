//
//  ThemeNative7.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 16.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "ThemeNative7.h"

@implementation ThemeNative7

// #FF3B30
UIColor *nativeRedColor;
// #34AADC
UIColor *nativeBlueColor;
// #4CD964
UIColor *nativeGreenColor;
// #2B2B2B
UIColor *nativeBlackColor;
// #F7F7F7
UIColor *nativeWhiteColor;

- (id)init {
    self = [super init];
    nativeRedColor = [UIColor colorWithRed:1.0 green:(59.0 / 255.0) blue:(48.0 / 255.0) alpha:1.0];
    nativeBlueColor = [UIColor colorWithRed:(52.0 / 255.0) green:(170.0 / 255.0) blue:(220.0 / 255.0) alpha:1.0];
    nativeGreenColor = [UIColor colorWithRed:(76.0 / 255.0) green:(217.0 / 255.0) blue:(100.0 / 255.0) alpha:1.0];
    nativeBlackColor = [UIColor colorWithRed:(43.0 / 255.0) green:(43.0 / 255.0) blue:(43.0 / 255.0) alpha:1.0];
    nativeWhiteColor = [UIColor colorWithRed:(247.0 / 255.0) green:(247.0 / 255.0) blue:(247.0 / 255.0) alpha:1.0];
    return self;
}

- (UIColor *)getColorFor:(ThemePropertyType)property {
    switch (property) {
        case THEME_TIMER_INACTIVE:
            return nativeBlackColor;
        case THEME_TIMER_EXERCISE:
            return nativeRedColor;
        case THEME_TIMER_RELAXATION:
            return nativeGreenColor;
        case THEME_START:
            return nativeGreenColor;
        case THEME_STOP:
            return nativeRedColor;
        case THEME_PAUSE:
            return nativeBlueColor;
        case THEME_ROUND:
            return nativeBlackColor;
        case THEME_NAVIGATION_BUTTONS:
            return nativeRedColor;
        default:
            return nativeBlackColor;
    }
}

- (UIFont *)getFontFor:(ThemePropertyType)property {
    return [UIFont systemFontOfSize:[self getFontSizeFor:property]];
}

- (CGFloat)getFontSizeFor:(ThemePropertyType)property {
    switch (property) {
        case THEME_TIMER_INACTIVE:
            return 140;
        case THEME_TIMER_EXERCISE:
            return 140;
        case THEME_TIMER_RELAXATION:
            return 140;
        case THEME_START:
            return 36;
        case THEME_STOP:
            return 36;
        case THEME_PAUSE:
            return 36;
        case THEME_ROUND:
            return 36;
        case THEME_NAVIGATION_BUTTONS:
            return 17;
        default:
            return 17;
    }
}


@end
