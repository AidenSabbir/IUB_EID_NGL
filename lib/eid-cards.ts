export type EidCardConfig = {
  id: string;
  image: string;
  rect: { top: string; left: string; width: string; height: string };
  color: string;
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
};

export const EID_CARDS: EidCardConfig[] = [
  {
    id: '1',
    image: '/cards/1.png',
    rect: { top: '35.8%', left: '15.5%', width: '67.5%', height: '26.5%' },
    color: '#4b164c',
    align: 'center',
  },
  {
    id: '2',
    image: '/cards/2.png',
    rect: { top: '36%', left: '13%', width: '74%', height: '25%' },
    color: '#4B2C20',
    align: 'center',
  },
  {
    id: '3',
    image: '/cards/3.png',
    rect: { top: '34%', left: '20%', width: '60%', height: '23%' },
    color: '#001A57',
    align: 'center',
  },
  {
    id: '4',
    image: '/cards/4.png',
    rect: { top: '70%', left: '15%', width: '72%', height: '25%' },
    color: '#5D4037',
    align: 'center',
  },
];
