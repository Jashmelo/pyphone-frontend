import React, { useRef, useEffect } from 'react';

const NeuralBackground = ({ theme = 'neural' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles = [];
        const count = theme === 'cyber' ? 80 : 50;

        const getColors = () => {
            switch (theme) {
                case 'sunset': return { dot: '#f97316', line: 'rgba(249, 115, 22, 0.15)', bg: 'rgba(67, 20, 7, 0.2)' };
                case 'cyber': return { dot: '#06b6d4', line: 'rgba(6, 182, 212, 0.2)', bg: 'rgba(8, 7, 13, 0.3)' };
                case 'midnight': return { dot: '#312e81', line: 'rgba(49, 46, 129, 0.2)', bg: 'rgba(3, 7, 18, 0.4)' };
                default: return { dot: '#4f46e5', line: 'rgba(79, 70, 229, 0.1)', bg: 'rgba(0, 0, 0, 0.2)' };
            }
        };

        const colors = getColors();

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * (theme === 'cyber' ? 1.2 : 0.5),
                vy: (Math.random() - 0.5) * (theme === 'cyber' ? 1.2 : 0.5),
                size: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = colors.dot;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.strokeStyle = colors.line;
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < (theme === 'cyber' ? 100 : 150)) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [theme]);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

export default NeuralBackground;
