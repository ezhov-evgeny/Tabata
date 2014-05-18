//
//  TabataViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import "TabataViewController.h"
#import "Tabata.h"
#import "Theme.h"
#import "SoundEffects.h"
#import "ThemeNative7.h"

@interface TabataViewController ()

@end

@implementation TabataViewController

Tabata *tabata;
NSObject <Theme> *theme;

- (void)viewDidLoad {
    [super viewDidLoad];
    theme = [ThemeNative7 new];
    [self.timerLabel setText:@"0.00"];
    [self.pauseButton setHidden:true];
    [self.stopButton setHidden:true];
    [self.navigationController.navigationBar setTintColor:[theme getColorFor:THEME_NAVIGATION_BUTTONS]];
    [self.startButton setTintColor:[theme getColorFor:THEME_START]];
    [self.stopButton setTintColor:[theme getColorFor:THEME_STOP]];
    [self.pauseButton setTintColor:[theme getColorFor:THEME_PAUSE]];
    [self.startButton.titleLabel setFont:[theme getFontFor:THEME_START]];
    [self.roundLabel setFont:[theme getFontFor:THEME_ROUND]];
    [self.roundLabel setTextColor:[theme getColorFor:THEME_ROUND]];
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
    [self showRound];
    [self showTime];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onStartPressed:(id)sender {
    [self.startButton setHidden:true];
    [self.pauseButton setHidden:false];
    [self.stopButton setHidden:false];
    [tabata start];
}

- (IBAction)onStopPressed:(id)sender {
    [self.startButton setHidden:false];
    [self.pauseButton setHidden:true];
    [self.stopButton setHidden:true];
    [tabata stop];
}

- (IBAction)onPausePressed:(id)sender {
    [self.startButton setHidden:false];
    [self.pauseButton setHidden:true];
    [self.stopButton setHidden:false];
    [tabata pause];
}

- (void)tabataStateChanged:(NSNotification *)notification {
    switch ([tabata getState]) {
        case STARTING:
            self.timerLabel.textColor = [theme getColorFor:THEME_TIMER_INACTIVE];
            break;
        case EXERCISE:
            self.timerLabel.textColor = [theme getColorFor:THEME_TIMER_EXERCISE];
            break;
        case RELAXATION:
            self.timerLabel.textColor = [theme getColorFor:THEME_TIMER_RELAXATION];
            break;
        default:
            self.timerLabel.textColor = [theme getColorFor:THEME_TIMER_INACTIVE];
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
    self.roundLabel.text = [NSString stringWithFormat:@"Round %i / %i", [tabata getCurrentRound], [tabata getRoundAmount]];
}
@end
