---
name: 猫在 MAOZAI
description: 奶油纸面与鼠尾草绿的轻盈猫咪陪伴界面
colors:
  primary: "#45583d"
  paper: "#faf9f5"
  ink: "#353b30"
  muted: "#686d60"
  sage: "#e9eddf"
  line: "#d8ddce"
  accent: "#aa633c"
  button-text: "#fffdf5"
typography:
  display:
    fontFamily: "KaiTi, STKaiti, Noto Serif CJK SC, serif"
    fontSize: "clamp(42px, 4vw, 60px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-1.4px"
  headline:
    fontFamily: "Segoe UI, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "31px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.6px"
  body:
    fontFamily: "Segoe UI, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "15px"
  label:
    fontFamily: "Segoe UI, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  field: "9px"
  surface: "24px"
  surface-mobile: "19px"
  preview: "5px"
spacing:
  field-gap: "10px"
  section-gap: "23px"
  desktop-inline: "40px"
  mobile-inline: "14px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.button-text}"
    rounded: "{rounded.field}"
    height: "49px"
  input:
    rounded: "{rounded.field}"
    textColor: "{colors.ink}"
    height: "49px"
    padding: "0 14px"
---

# Design System: 猫在

## Overview

**Creative North Star: "安静等你回家"**

以奶油色纸面、柔和绿底和原创矢量猫咪建立陪伴感。主任务保持清晰，方向检查工具收在用户主动展开的区域。此记录从交付代码提取，色彩与命名是本次原型的选择，未代表用户确认的长期品牌规范。

**Key Characteristics:**

- 温暖、安静的色面。
- 猫咪动作承载主要动效。
- 清晰的输入标签与单一主操作。

## Colors

Primary 为登录按钮、品牌与选中状态；Sage 为猫咪陪伴场景；Paper 为页面与表单区域。Ink 与 Muted 区分正文层级，Accent 仅在标点、焦点等少量位置使用。

## Typography

主视觉使用楷体/衬线字体栈，表单采用系统中文无衬线。移动端主视觉为 37px，登录标题为 28px。输入为 14px，说明文字多为 11–14px。字体均使用本地回退，不需要远程请求；不同设备的字形可能不同。系统登录标题是本次原型实现的限制，不据此建立未来品牌展示字体规范。

## Layout

桌面主容器最大 1472px，左右列比例为 1.13:1。登录内容最大宽 360px。1100px 以下收紧留白，760px 以下改为上下堆叠，移动登录内容最大 420px。320px 的窄屏布局已检查。方向面板展开后自然增长页面，不覆盖输入区域。

## Elevation & Depth

界面不使用投影，以底色、细描边与空间表达分组。猫咪脚下为独立扁平地面椭圆，与交互层分开。

## Shapes

主场景采用较宽圆角，输入框与按钮使用一致的小圆角。猫咪素材为统一 600×600 的原创矢量帧，统一构图与基准点；切换时保持身体对齐。

## Components

主按钮为实心绿色，次按钮为空心描边；按钮与输入框最小高度为 49px。焦点为有偏移的暖色轮廓。密码框右侧有显示/隐藏按钮，聚焦时猫咪看向别处。

猫咪保留 7×7 关键方向，以实际猫眼位置归一化指针。默认矢量角色按 49 张关键姿态的几何数值连续插值，不混合多张整图；普通图片回退模式只显示单帧。指针平滑时间常数约 45ms，方向索引迟滞 0.12 格，离开或触屏松手延迟 220ms 回中。系统减少动态效果或安静陪伴开关会关闭时间缓动。普通控件颜色变化为 180ms ease-out。

## Do's and Don'ts

- Do 保留主体素材对齐、清晰标签、键盘焦点和减少动态支持。
- Do 将开发检查工具放在可收起的方向面板。
- Don't 把占位猫描述为对参考图的复刻，或把本地演示称为真实认证。
- Don't 将当前系统字体与箭头字形等原型实现限制提升为后续品牌规则。
