//
//  SoundEffects.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 02.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "SoundEffects.h"
#import "Tabata.h"
#import "SettingsStorage.h"
#import <AVFoundation/AVFoundation.h>

@implementation SoundEffects

SoundEffects *soundEffects;
AVAudioPlayer *player;
SettingsStorage *storage;
BOOL enabled;

+ (void)registerSoundEffects
{
    soundEffects = [SoundEffects new];
    [[NSNotificationCenter defaultCenter] addObserver:soundEffects
                                          selector:@selector(stateChanged:)
                                          name:StateChanged
                                          object:Nil];
    [[NSNotificationCenter defaultCenter] addObserver:soundEffects
                                          selector:@selector(prepareSignal:)
                                          name:PrepareSignal
                                          object:Nil];
    NSError *error;
    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"beep_01" ofType:@"mp3"]];
    player = [[AVAudioPlayer alloc] initWithContentsOfURL:url error:&error];
    [player setNumberOfLoops:0];
    [player prepareToPlay];
    enabled = [storage loadSoundEnabled];
}

+ (BOOL)isEnabled
{
    return enabled;
}

+ (void)setEnabled:(BOOL)newValue
{
    enabled = newValue;
    [storage saveSoundEnabled:newValue];
}

- (void)stateChanged:(NSNotification*)notification
{
    if (enabled)
    {
        Tabata *tabata = [notification object];
        switch (tabata.getState) {
            case EXERCISE:
            case RELAXATION:
                [player play];
                break;

            default:
                break;
        }
    }
}

- (void)prepareSignal:(NSNotification*)notification
{
    if (enabled) {
        [player play];
    }

}

@end
