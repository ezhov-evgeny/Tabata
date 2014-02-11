//
//  ru_ezhoffViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import "ru_ezhoffViewController.h"
#import "Tabata.h"
#import "SoundEffects.h"

@interface ru_ezhoffViewController ()

@end

@implementation ru_ezhoffViewController

Tabata *tabata;

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.timerLabel.text = @"Loaded";
    tabata = [Tabata getTabata];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                          selector:@selector(tabataStateChanged:)
                                          name:StateChanged
                                          object:tabata];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                          selector:@selector(tabataTimerUpdated:)
                                          name:TimerUpdated
                                          object:tabata];
    [SoundEffects registerSoundEffects];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onActionPressed:(id)sender
{
    if ([tabata getState] == IDLE)
    {
        [tabata start];
    }
    else
    {
        [tabata stop];
    }
}

- (void)tabataStateChanged:(NSNotification *)notification
{
    switch ([tabata getState]) {
        case STARTING:
            self.timerLabel.textColor = [UIColor colorWithRed:0.0 green:0.0 blue:1.0 alpha:1.0];
            break;
        case EXERCISE:
            self.timerLabel.textColor = [UIColor colorWithRed:1.0 green:0.0 blue:0.0 alpha:1.0];
            break;
        case RELAXATION:
            self.timerLabel.textColor = [UIColor colorWithRed:0.0 green:1.0 blue:0.0 alpha:1.0];
            break;
        default:
            break;
    }
    [self showRound];
    [self tabataTimerUpdated:notification];
}

- (void)tabataTimerUpdated:(NSNotification *)notification
{
    switch ([tabata getState]) {
        case RELAXATION:
        case STARTING:
            [self showTime];
            break;
        case EXERCISE:
            [self showTime];
            break;
        default:
            break;
    }
}

- (void)showTime
{
    self.timerLabel.text = [NSString stringWithFormat:@"%04.02f", [tabata getCurrentTime]];
}

- (void)showRound
{
    self.roundLabel.text = [NSString stringWithFormat:@"Round %i/%i", [tabata getCurrentRound], [tabata getRoundAmount]];
}
@end
