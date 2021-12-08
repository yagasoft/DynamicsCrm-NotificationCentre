# DynamicsCrm-NotificationCentre

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/yagasoft/DynamicsCrm-NotificationCentre?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

### Version: 4.1.1.1
---

A CRM solution that injects a button into CRM's navigation bar, which shows notifications in near real-time from within CRM.

### Features

  + Easy access to messages, anywhere in CRM
  + Near real-time notifications
  + Group unread messages at the top of the list
  + Popup toast message
  + Configurable message check interval
  + Messages can be shown to users, teams, security role, or global
  + Out-of-the-box plugins to show notifications for new tasks and emails targeted at current user

### Guide

  + Install
  + Enable the Notifications Centre (NC) functionality in the Common Configuration entity (switch to NC Form after first save)
  + Create a default NC Configuration record, or override for a specific user
  + Assign the users the NC User/Admin security role
  + Refresh

### Install

  + Import solution found at [Dynamics365-YsCommonSolution](https://github.com/yagasoft/Dynamics365-YsCommonSolution).
  + Import NC solutions from this repository

## Screenshots

![File](https://github.com/yagasoft/DynamicsCrm-NotificationCentre/raw/master/imgs/nc-new-notification.png)

![File](https://github.com/yagasoft/DynamicsCrm-NotificationCentre/raw/master/imgs/nc-menu.png)

## Changes

#### _v4.1.1.1 (2021-12-08)_
+ Fixed: proper v9 compatibility
#### _v3.1.1.1 (2019-02-28)_
+ Changed: moved to a new namespace
#### _v2.1.1.1 (2018-09-11)_
+ Initial release

---
**Copyright &copy; by Ahmed Elsawalhy ([Yagasoft](http://yagasoft.com))** -- _GPL v3 Licence_
