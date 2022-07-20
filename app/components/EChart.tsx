import * as echarts from 'echarts';
import type { LocaleOption } from 'echarts/types/src/core/locale';
import type { RendererType, ThemeOption } from 'echarts/types/src/util/types';
import { useEffect, useState } from 'react';

import { useHoverObserver } from '~/utils/hooks';

type EChartsInitOpts = {
  locale?: string | LocaleOption;
  renderer?: RendererType;
  devicePixelRatio?: number;
  useDirtyRect?: boolean;
  width?: number;
  height?: number;
};

export type EChartProps = {
  option: echarts.EChartsOption;
  theme?: string | ThemeOption;
  initOpts?: EChartsInitOpts;
  isLoading?: boolean;
};

const mutateChart = (
  chart: echarts.ECharts | undefined,
  mutation: (chart: echarts.ECharts) => void
) => {
  if (chart && !chart.isDisposed()) {
    mutation(chart);
  }
};

const useAutoResize = (chart: echarts.ECharts | undefined) => {
  const dom = chart?.getDom();
  useEffect(() => {
    const resizeListener = () => {
      // console.log(`resize chart ${chart?.id}`)
      mutateChart(chart, () => {
        chart!.resize();
      });
    };
    const s = new ResizeObserver(resizeListener);
    if (dom) {
      s.observe(dom);
    }
    return () => {
      s.disconnect();
    };
  }, [chart, dom]);
};

const useEChartsOption = (
  chart: echarts.ECharts | undefined,
  option: echarts.EChartsOption
) => {
  useEffect(() => {
    mutateChart(chart, (chart) => chart.setOption(option, true));
  }, [chart, option]);
};

const useECharts = (
  el: HTMLDivElement | null,
  theme: EChartProps['theme'],
  initOpts: EChartProps['initOpts']
) => {
  const [chart, setChart] = useState<echarts.ECharts>();
  useEffect(() => {
    if (el) {
      const instance =
        echarts.getInstanceByDom(el) || echarts.init(el, theme, initOpts);
      setChart(instance);
    }
  }, [el, theme, initOpts]);

  useEffect(() => {
    return () => {
      chart?.dispose();
    };
  }, [chart]);

  return chart;
};

const useLoading = (chart: echarts.ECharts | undefined, loading?: boolean) => {
  useEffect(() => {
    mutateChart(chart, (chart) => {
      if (loading) {
        chart.showLoading();
      } else {
        chart.hideLoading();
      }
    });
  }, [chart, loading]);
};

const useHoveredToolbox = (
  el: HTMLDivElement | null,
  chart: echarts.ECharts | undefined
) => {
  const isHover = useHoverObserver(el);
  useEffect(() => {
    chart?.setOption({ toolbox: { show: isHover } });
  }, [isHover, chart]);
};

const DefaultStyle = { width: '100%', height: '100%', marginRight: 0 };

const EChart = (props: EChartProps) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const chart = useECharts(containerEl, props.theme, props.initOpts);
  useEChartsOption(chart, props.option);
  useLoading(chart, props.isLoading);
  useAutoResize(chart);
  useHoveredToolbox(containerEl, chart);
  return <div ref={setContainerEl} style={DefaultStyle} />;
};

export default EChart;
