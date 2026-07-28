---
title: ADB 常用命令
date: 2026-07-28
description: ADB 常用命令
categories:
  - 技术
tags:
  - 博客
---

# ADB常用命令

列举常见的 adb 命令

```sh
adb shell --- logcat -c && logcat |grep -inE --color "关键字"（打印log）

adb shell wm size （查看屏幕分辨率）

adb shell wm size 480x960 （修改屏幕分辨率，后面改成 reset 恢复默认分辨率）

adb enable-verity && adb reboot （恢复到 remount 之前的状态）

adb shell dumpsys window | findstr mCurrentFocus （前台应用包名和 Activity）

adb shell dmesg -w | find "CAM-" （实时打印 kernel log）

adb shell cat /sys/devices/platform/soc/1a00e000.seninf-top/status（查看 pd 数据）

adb shell dumpsys media.camera（dump metadata tag 数据）

adb shell cat /proc/uptime （开机时间到当前时间的差值，秒级）

adb shell cat /proc/meminfo （查看内存相关情况）
```
