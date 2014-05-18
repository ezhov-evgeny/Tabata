//
//  TabataViewController.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TabataViewController : UIViewController

@property(strong, nonatomic) IBOutlet UILabel *timerLabel;

@property(strong, nonatomic) IBOutlet UILabel *roundLabel;

@property(strong, nonatomic) IBOutlet UIButton *startButton;

@property(strong, nonatomic) IBOutlet UIButton *stopButton;

@property(strong, nonatomic) IBOutlet UIButton *pauseButton;

- (IBAction)onStartPressed:(id)sender;

- (IBAction)onStopPressed:(id)sender;

- (IBAction)onPausePressed:(id)sender;

@end
