//
//  ru_ezhoffViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import "ru_ezhoffViewController.h"
#import <AVFoundation/AVFoundation.h>

@interface ru_ezhoffViewController ()

@property (strong, nonatomic) NSTimer *timer;
@property (strong, nonatomic) NSDate *startDate;

@end

@implementation ru_ezhoffViewController

typedef enum TabataStates
{
    IDLE,
    STARTING,
    EXERCISE,
    RELAXATION

} TabataStates;

const float UPDATE_INTERVAL = 0.01;

bool active = false;
enum TabataStates tabataState = IDLE;
float startingDuration = 3.0;
float exerciseDuration = 3.0;
float relaxationDuration = 3.0;
int roundAmount = 4;
float currentStarting;
float currentExercise;
float currentRelaxation;
int currentRound = 0;

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.timerLabel.text = @"Loaded";
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onActionPressed:(id)sender
{
    if (tabataState == IDLE)
    {
        self.timer = [NSTimer scheduledTimerWithTimeInterval:UPDATE_INTERVAL
                                                    target:self
                                                    selector:@selector(tabataUpdate)
                                                    userInfo:nil
                                                    repeats:YES];
    }
    else
    {
        [self stopTabata];
    }
}

- (void)tabataUpdate
{
    switch (tabataState) {
        case IDLE:
            tabataState = STARTING;
            currentRound = 0;
            currentStarting = startingDuration;
            self.timerLabel.textColor = [UIColor colorWithRed:0.0 green:0.0 blue:1.0 alpha:1.0];
            break;

        case STARTING:
            currentStarting -= UPDATE_INTERVAL;
            [self showTime:currentStarting];
            if (currentStarting == (int) currentStarting)
            {
                AVAudioPlayer *readyPlayer;
            }
            if (currentStarting <= 0)
            {
                tabataState = EXERCISE;
                currentExercise = exerciseDuration;
                [self showRound:++currentRound];
                self.timerLabel.textColor = [UIColor colorWithRed:1.0 green:0.0 blue:0.0 alpha:1.0];
            }
            break;

        case EXERCISE:
            currentExercise -= UPDATE_INTERVAL;
            [self showTime:currentExercise];
            if (currentExercise <= 0)
            {
                if (currentRound >= roundAmount)
                {
                    [self stopTabata];
                }
                else
                {
                    tabataState = RELAXATION;
                    currentRelaxation = relaxationDuration;
                    self.timerLabel.textColor = [UIColor colorWithRed:0.0 green:1.0 blue:0.0 alpha:1.0];
                }
            }
            break;

        case RELAXATION:
            currentRelaxation -= UPDATE_INTERVAL;
            [self showTime:currentRelaxation];
            if (currentRelaxation <= 0)
            {
                tabataState = EXERCISE;
                currentExercise = exerciseDuration;
                [self showRound:++currentRound];
                self.timerLabel.textColor = [UIColor colorWithRed:1.0 green:0.0 blue:0.0 alpha:1.0];
            }
            break;
        default:
            break;
    }
}

- (void)stopTabata
{
    tabataState = IDLE;
    [self.timer invalidate];
    self.timer = nil;
    currentRound = 0;
    [self showTime:0];
    [self showRound:currentRound];
}

- (void)showTime:(float)time
{
    self.timerLabel.text = [NSString stringWithFormat:@"%2i:%2i:%2i", time  ,time];
    self.timerLabel.text = [NSString stringWithFormat:@"%04.02f", time];
}

- (void)showRound:(int)round
{
    self.roundLabel.text = [NSString stringWithFormat:@"Round %i/%i", round, roundAmount];
}
@end
