---
title: ADB 常用命令
date: 2026-07-28
description: 常用 adb 命令速查，持续补充。
categories: [技术]
tags: [ADB, Android]
---

常用 adb 命令速查，持续补充。

- `adb shell logcat -c && logcat | grep -inE --color "关键字"` —— 清空并打印按关键字过滤的 log
- `adb shell wm size` —— 查看屏幕分辨率
- `adb shell wm size 480x960` —— 修改屏幕分辨率（恢复默认用 `adb shell wm size reset`）
- `adb enable-verity && adb reboot` —— 恢复到 remount 之前的状态
- `adb shell dumpsys window | findstr mCurrentFocus` —— 查看前台应用包名和 Activity
- `adb shell dmesg -w | find "CAM-"` —— 实时打印 kernel log
- `adb shell cat /sys/devices/platform/soc/1a00e000.seninf-top/status` —— 查看 pd 数据
- `adb shell dumpsys media.camera` —— dump metadata tag 数据
- `adb shell cat /proc/uptime` —— 开机至今的时长（秒）
- `adb shell cat /proc/meminfo` —— 查看内存相关情况
