document.addEventListener('DOMContentLoaded', function () {
    const scrollToScheduleBtn = document.querySelector('.js--scroll-to-schedule');
    const scrollToCaloriesBtn = document.querySelector('.js--scroll-to-calories');
    const scrollToResultBtn = document.querySelector('.js--scroll-to-result');
    const scrollToCalCalBtn = document.querySelector('.js--scroll-to-cal-cal');

    if (scrollToScheduleBtn) {
        scrollToScheduleBtn.addEventListener('click', () => {
            document.querySelector('.js--schedule').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (scrollToCaloriesBtn) {
        scrollToCaloriesBtn.addEventListener('click', () => {
            document.querySelector('.js--calories').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (scrollToResultBtn) {
        scrollToResultBtn.addEventListener('click', () => {
            setTimeout(() => {
                document.querySelector('.js--schedule-result').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        });
    }

    if (scrollToCalCalBtn) {
        scrollToCalCalBtn.addEventListener('click', () => {
            setTimeout(() => {
                document.querySelector('.js--cal-cal').scrollIntoView({ behavior: 'smooth' });
            }, 300);
        });
    }
});
