//
//  SettingsStorage.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 02.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "SettingsStorage.h"

@implementation SettingsStorage

NSString *const TABATA_STARTING_DURATION = @"TabataStartingDuration";
NSString *const TABATA_EXERCISE_DURATION = @"TabataExerciseDuration";
NSString *const TABATA_RELAXATION_DURATION = @"TabataRelaxationDuration";
NSString *const TABATA_ROUND_AMOUNT = @"TabataRoundAmount";
NSString *const SOUND_ENABLED = @"SoundEnabled";


- (float)loadStartingDuration
{
    return [[NSUserDefaults standardUserDefaults] floatForKey:TABATA_STARTING_DURATION];
}

- (float)loadExerciseDuration
{
    return [[NSUserDefaults standardUserDefaults] floatForKey:TABATA_EXERCISE_DURATION];
}

- (float)loadRelaxationDuration
{
    return [[NSUserDefaults standardUserDefaults] floatForKey:TABATA_RELAXATION_DURATION];
}

- (int)loadRoundAmount
{
    return (int) [[NSUserDefaults standardUserDefaults] integerForKey:TABATA_ROUND_AMOUNT];
}

- (BOOL)loadSoundEnabled
{
    return [[NSUserDefaults standardUserDefaults] boolForKey:SOUND_ENABLED];
}

- (void)saveStartingDuration:(float)duration
{
    [[NSUserDefaults standardUserDefaults] setFloat:duration forKey:TABATA_STARTING_DURATION];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)saveExerciseDuration:(float)duration
{
    [[NSUserDefaults standardUserDefaults] setFloat:duration forKey:TABATA_EXERCISE_DURATION];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)saveRelaxationDuration:(float)duration
{
    [[NSUserDefaults standardUserDefaults] setFloat:duration forKey:TABATA_RELAXATION_DURATION];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)saveRoundAmount:(int)amound
{
    [[NSUserDefaults standardUserDefaults] setInteger:amound forKey:TABATA_ROUND_AMOUNT];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)saveSoundEnabled:(BOOL)enabled
{
    [[NSUserDefaults standardUserDefaults] setBool:enabled forKey:SOUND_ENABLED];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end
