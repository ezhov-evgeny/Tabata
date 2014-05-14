//
//  ru_ezhoffViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import "ru_ezhoffViewController.h"
#import "Tabata.h"
#import "Theme.h"
#import "SoundEffects.h"
#import "ThemeStub.h"

@interface ru_ezhoffViewController ()

@end

@implementation ru_ezhoffViewController

Tabata *tabata;
NSObject <Theme> *theme;

- (void)viewDidLoad {
    [super viewDidLoad];
    self.timerLabel.text = @"Loaded";
    self.pauseButton.hidden = true;
    self.stopButton.hidden = true;
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

    theme = [ThemeStub new];

}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onStartPressed:(id)sender {
    self.startButton.hidden = true;
    self.pauseButton.hidden = false;
    self.stopButton.hidden = false;
    [tabata start];
}

- (IBAction)onStopPressed:(id)sender {
    self.startButton.hidden = false;
    self.pauseButton.hidden = true;
    self.stopButton.hidden = true;
    [tabata stop];
}

- (IBAction)onPausePressed:(id)sender {
    self.startButton.hidden = false;
    self.pauseButton.hidden = true;
    self.stopButton.hidden = false;
    [tabata pause];
}

- (void)tabataStateChanged:(NSNotification *)notification {
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
            self.timerLabel.textColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:1.0];
            break;
    }
    [self showRound];
    [self tabataTimerUpdated:notification];
}

- (void)tabataTimerUpdated:(NSNotification *)notification {
    [self showTime];
}

- (void)showTime {
    self.timerLabel.text = [NSString stringWithFormat:@"%04.02f", [tabata getCurrentTime]];
}

- (void)showRound {
    self.roundLabel.text = [NSString stringWithFormat:@"Round %i/%i", [tabata getCurrentRound], [tabata getRoundAmount]];
}
@end
