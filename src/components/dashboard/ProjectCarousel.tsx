
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export const ProjectCarousel: React.FC = () => {
  return (
    <div className="relative px-4 -mx-4">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Resumo de Projetos em Destaque</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {[1, 2, 3, 4].map(item => (
            <CarouselItem key={item} className="basis-full sm:basis-1/2 lg:basis-1/3">
              <Card className="ocean-card">
                <CardHeader className="pb-2 border-b border-border/20">
                  <CardTitle className="text-lg text-foreground">Projeto {item}</CardTitle>
                  <CardDescription>Descrição breve do projeto</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Progresso:</span>
                      <span className="text-sm text-primary font-semibold">{65 + item * 5}%</span>
                    </div>
                    <Progress value={65 + item * 5} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Prazo: 15 dias</span>
                      <span>12/18 tarefas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-background/90 border-border/30 text-primary hover:bg-primary/10 hover:text-primary" />
        <CarouselNext className="right-0 bg-background/90 border-border/30 text-primary hover:bg-primary/10 hover:text-primary" />
      </Carousel>
    </div>
  );
};
